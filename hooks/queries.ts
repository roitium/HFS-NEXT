import { skipToken, useQuery } from '@tanstack/react-query'
import { fetchHFSApiFromServer } from '@/app/actions'
import { HFS_APIs } from '@/app/constants'
import type {
  ExamDetail,
  ExamListResponse,
  ExamOverviewV4,
  LastExamOverview,
  UserSnapshot,
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
          const response = await fetchHFSApiFromServer<ExamListResponse>(
            HFS_APIs.examList,
            {
              method: 'GET',
              token: token,
            },
          )
          if (!response.ok) {
            throw new Error(response.errMsg || '获取考试列表失败')
          }
          const newExams: {
            name: string
            score: string
            released: string
            examId: string
          }[] = []
          for (const exam of response.payload.list) {
            newExams.push({
              name: exam.name,
              score: `${exam.score}/${exam.manfen}`,
              released: formatTimestamp(exam.time),
              examId: exam.examId,
            })
          }
          return newExams
        }
      : skipToken,
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
