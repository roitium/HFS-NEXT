import { skipToken, useQuery } from '@tanstack/react-query'
import { fetchHFSApiFromServer } from '@/app/actions'
import { HFS_APIs } from '@/app/constants'
import type {
  ExamDetail,
  ExamOverviewV4,
  LastExamOverview,
  UserSnapshot,
  WrongItemsOverviewResponse,
} from '@/types/exam'
import { formatTimestamp } from '@/utils/time'

export const queryKeys = {
  all: () => ['hfsnext'],
  examList: () => [...queryKeys.all(), 'examList'],
  lastExamOverview: () => [...queryKeys.all(), 'lastExamOverview'],
  examOverview: (examId: number) => [
    ...queryKeys.all(),
    'examOverview',
    examId,
  ],
  examOverviewV4: (examId: number) => [
    ...queryKeys.all(),
    'examOverviewV4',
    examId,
  ],
  examRankInfo: (examId: number) => [
    ...queryKeys.all(),
    'examRankInfo',
    examId,
  ],
  answerPicture: (examId: number, paperId: string, pid: string) => [
    ...queryKeys.all(),
    'answerPicture',
    examId,
    paperId,
    pid,
  ],
  paperRankInfo: (examId: number, paperId: string) => [
    ...queryKeys.all(),
    'paperRankInfo',
    examId,
    paperId,
  ],
}

export const useExamListQuery = (token: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.examList(),
    queryFn: token
      ? async () => {
          const response = await fetchHFSApiFromServer<WrongItemsOverviewResponse[]>(
            HFS_APIs.examList,
            {
              method: 'GET',
              token: token,
            },
          )
          if (!response.ok) {
            throw new Error(response.errMsg || '获取考试列表失败')
          }
          // 从各学科的 examList 中提取考试，按 examId 去重
          const examMap = new Map<string, {
            name: string
            released: string
            examId: string
            examTime: number
          }>()
          for (const subject of response.payload) {
            for (const exam of subject.examList) {
              if (!examMap.has(exam.examId)) {
                examMap.set(exam.examId, {
                  name: exam.examName,
                  released: formatTimestamp(exam.examTime),
                  examId: exam.examId,
                  examTime: exam.examTime,
                })
              }
            }
          }
          // 按 examTime 降序排序（最新的在前）
          const sortedExams = Array.from(examMap.values())
            .sort((a, b) => b.examTime - a.examTime)

          // 批量获取每个考试的详情（包括分数）
          const examDetails = await Promise.all(
            sortedExams.map(async (exam) => {
              try {
                const detailResponse = await fetchHFSApiFromServer<ExamDetail>(
                  HFS_APIs.examOverview,
                  {
                    method: 'GET',
                    token: token,
                    getParams: {
                      examId: exam.examId,
                    },
                  },
                )
                if (detailResponse.ok) {
                  return {
                    name: exam.name,
                    score: `${detailResponse.payload.score}/${detailResponse.payload.manfen}`,
                    released: exam.released,
                    examId: exam.examId,
                  }
                }
              } catch {
                // 获取详情失败，返回无分数版本
              }
              return {
                name: exam.name,
                score: '-',
                released: exam.released,
                examId: exam.examId,
              }
            })
          )
          return examDetails
        }
      : skipToken,
    staleTime: 1000 * 60 * 60, // 缓存 1 小时
  })
}

export const useUserSnapshotQuery = (token: string | undefined) => {
  return useQuery({
    queryKey: [...queryKeys.all(), 'userSnapshot'],
    queryFn: token
      ? async () => {
          const response = await fetchHFSApiFromServer<UserSnapshot>(
            HFS_APIs.userSnapshot,
            {
              method: 'GET',
              token: token,
            },
          )
          if (!response.ok) {
            throw new Error(response.errMsg || '获取用户信息失败')
          }
          return response.payload
        }
      : skipToken,
    staleTime: 1000 * 60 * 240, // 缓存 4h
  })
}

export const useExamOverviewQuery = (
  token: string | undefined,
  id?: string,
) => {
  return useQuery({
    queryKey: [...queryKeys.all(), 'examOverview'],
    queryFn:
      token && id
        ? async () => {
            const response = await fetchHFSApiFromServer<ExamDetail>(
              HFS_APIs.examOverview,
              {
                method: 'GET',
                token: token,
                getParams: {
                  examId: id,
                },
              },
            )
            if (!response.ok) {
              throw new Error(response.errMsg || '获取考试详情失败')
            }
            return response.payload
          }
        : skipToken,
  })
}

export const usePaperImageUrlsQuery = (
  token: string | undefined,
  examId: number,
  paperId: string,
  pid: string,
) => {
  return useQuery({
    queryKey: queryKeys.answerPicture(examId, paperId, pid),
    queryFn: token
      ? async () => {
          const response = await fetchHFSApiFromServer<{ url: string[] }>(
            HFS_APIs.answerPicture,
            {
              method: 'GET',
              token: token,
              getParams: {
                paperId: paperId,
                pid: pid,
                examId: examId,
              },
            },
          )
          if (!response.ok) {
            throw new Error(response.errMsg || '获取答题卡图片失败')
          }
          return response.payload.url
        }
      : skipToken,
  })
}

export const useLastExamOverviewQuery = (token: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.lastExamOverview(),
    queryFn: token
      ? async () => {
          const response = await fetchHFSApiFromServer<LastExamOverview>(
            HFS_APIs.lastExamOverview,
            {
              method: 'GET',
              token: token,
            },
          )
          if (!response.ok) {
            throw new Error(response.errMsg || '获取最近考试详情失败')
          }
          return response.payload
        }
      : skipToken,
  })
}

export const useExamOverviewV4Query = (
  token: string | undefined,
  examId?: number,
) => {
  return useQuery({
    queryKey: examId !== undefined ? queryKeys.examOverviewV4(examId) : ['examOverviewV4', 'undefined'],
    queryFn:
      token && examId !== undefined
        ? async () => {
            const response = await fetchHFSApiFromServer<ExamOverviewV4>(
              HFS_APIs.examOverviewV4,
              {
                method: 'GET',
                token: token,
                getParams: {
                  examId: String(examId),
                },
              },
            )
            if (!response.ok) {
              throw new Error(response.errMsg || '获取年级排名失败')
            }
            return response.payload
          }
        : skipToken,
  })
}
