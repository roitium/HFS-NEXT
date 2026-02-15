'use client'
import html2canvas from 'html2canvas'
import { useRouter } from 'next/navigation'
import { use, useCallback, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  PaperHidingComponent,
  PaperShowingComponent,
} from '@/app/exam/[id]/paper'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/card'
import Navbar from '@/components/navBar'
import { GithubSVGIcon } from '@/components/svg'
import type { ExamObject, ExamRankInfo } from '@/types/exam'
import { formatTimestamp } from '@/utils/time'
import { useExamOverviewQuery, useExamOverviewV4Query, useUserSnapshotQuery } from '@/hooks/queries'
import { useStorage } from '@/hooks/useStorage'

function RankInfoComponent({
  rankInfo,
}: {
  rankInfo: ExamRankInfo | undefined
}) {
  return (
    <>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <div className='text-gray-500 text-sm dark:text-gray-400'>
            班级最高分
          </div>
          <div className='font-medium'>
            {rankInfo ? rankInfo.highest.class : '...'}
          </div>
        </div>
        <div>
          <div className='text-gray-500 text-sm dark:text-gray-400'>
            年级最高分
          </div>
          <div className='font-medium'>
            {rankInfo ? rankInfo.highest.grade : '...'}
          </div>
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <div className='text-gray-500 text-sm dark:text-gray-400'>
            班级平均分
          </div>
          <div className='font-medium'>
            {rankInfo ? rankInfo.avg.class : '...'}
          </div>
        </div>
        <div>
          <div className='text-gray-500 text-sm dark:text-gray-400'>
            年级平均分
          </div>
          <div className='font-medium'>
            {rankInfo ? rankInfo.avg.grade : '...'}
          </div>
        </div>
      </div>
    </>
  )
}

export default function ExamPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const router = useRouter()
  const [displayedPapersMode, setDisplayedPapersMode] = useState<{
    [index: string]: boolean
  }>({})
  const pageRef = useRef(null)
  const [token, setToken] = useStorage('hfs_token')
  const { data: userSnapshot } = useUserSnapshotQuery(token)
  const advancedMode = userSnapshot?.isMember ?? false
  const {
    data: examOverview,
    isError: isExamOverviewError,
    isPending: isExamOverviewPending,
  } = useExamOverviewQuery(token, params.id)
  const { data: examOverviewV4 } = useExamOverviewV4Query(
    token,
    examOverview?.examId,
  )

  const changeDisplayedMode = useCallback((paperId: string) => {
    setDisplayedPapersMode((prevState) => {
      return {
        ...prevState,
        [paperId]: !prevState[paperId],
      }
    })
  }, [])

  const createScreenshot = useCallback(async () => {
    if (!pageRef.current) {
      throw new Error('组件根节点ref为null???')
    }
    const canvas = await html2canvas(pageRef.current, {
      useCORS: true,
      foreignObjectRendering: true,
    })
    const dataURL = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataURL
    link.download = `exam_${params.id}_screenshot.png`
    link.click()
  }, [params.id])

  if (!token) {
    toast.error('你还没登录，返回登录页')
    router.push('/login')
    return null
  }

  if (isExamOverviewError) {
    toast.error('获取考试详情失败，请稍后再试')
    return null
  }

  if (isExamOverviewPending) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <Card className='w-full max-w-3xl'>
          <CardHeader>
            <CardTitle className='font-bold text-2xl'>正在加载...</CardTitle>
            <CardDescription>正在获取您的数据，请稍候。</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const examObject: ExamObject = {
    detail: examOverview,
  }

  return (
    <div
      className='mx-auto flex min-h-screen select-none flex-col bg-white px-4 pt-6 pb-2 md:px-4 md:pt-6 md:pb-2 dark:bg-gray-900'
      ref={pageRef}
    >
      <Navbar />
      <div className='flex flex-col gap-6 pt-6'>
        <Card>
          <CardHeader>
            <CardTitle>
              {examObject?.detail ? examObject.detail.name : params.id}
            </CardTitle>
            <div
              data-html2canvas-ignore='true'
              className='flex flex-row gap-3 pt-3'
            >
              <div className='grow-0 cursor-pointer rounded-full border border-gray-400 p-1 hover:bg-gray-200'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='size-5'
                >
                  <title>创建并下载截图</title>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z'
                  />
                </svg>
              </div>
              <div
                onClick={() => {
                  toast.promise(
                    createScreenshot(),
                    {
                      loading: '正在截图',
                      success: (
                        <span>
                          成功创建并下载截图！
                          <br />
                          (答题卡图片空白是正常的)
                        </span>
                      ),
                      error: (err: string) => `创建截图失败，原因：${err}`,
                    },
                    {
                      error: {
                        duration: 5000,
                      },
                      success: {
                        duration: 5000,
                      },
                    },
                  )
                }}
                className='grow-0 cursor-pointer rounded-full border border-gray-400 p-1 hover:bg-gray-200'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='size-5'
                >
                  <title>创建并下载截图</title>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z'
                  />
                </svg>
              </div>
            </div>
          </CardHeader>

          <CardContent className='grid gap-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <div className='text-gray-500 text-sm dark:text-gray-400'>
                  考试名
                </div>
                <div className='font-medium'>
                  {examObject?.detail ? examObject.detail.name : '...'}
                </div>
              </div>
              <div>
                <div className='text-gray-500 text-sm dark:text-gray-400'>
                  考试发布时间
                </div>
                <div className='font-medium'>
                  {examObject?.detail
                    ? formatTimestamp(examObject.detail.time as number)
                    : '...'}
                </div>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <div className='text-gray-500 text-sm dark:text-gray-400'>
                  满分
                </div>
                <div className='font-medium'>
                  {examObject?.detail ? examObject.detail.manfen : '...'}
                </div>
              </div>
              <div>
                <div className='text-gray-500 text-sm dark:text-gray-400'>
                  得分
                </div>
                <div className='font-medium'>
                  {examObject?.detail ? examObject.detail.score : '...'}
                </div>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <div className='text-gray-500 text-sm dark:text-gray-400'>
                  {advancedMode ? '班级排名/等第' : '班级排名'}
                </div>
                <div className='font-medium'>
                  {examObject?.detail
                    ? advancedMode
                      ? `${examObject.detail.classRank} (打败了全班${examObject.detail.classDefeatRatio}%的人)`
                      : examObject.detail.classRankS
                    : '...'}
                </div>
              </div>
              <div>
                <div className='text-gray-500 text-sm dark:text-gray-400'>
                  年级排名
                </div>
                <div className='font-medium'>
                  {examOverviewV4?.compare?.curGradeRank
                    ? examOverviewV4.compare.curGradeRank
                    : examObject?.detail?.gradeRank
                      ? examObject.detail.gradeRank
                      : '获取失败 无此数据'}
                </div>
              </div>
            </div>
            {advancedMode && (
              <div>
                <div className='text-gray-500 text-sm dark:text-gray-400'>
                  {advancedMode ? '年级排名/等第' : '年级排名'}
                </div>
                <div className='font-medium'>
                  {examObject?.detail
                    ? advancedMode
                      ? `${examObject.detail.gradeRank} (打败了全年级${examObject.detail.gradeDefeatRatio}%的人)`
                      : examObject.detail.gradeRankS
                    : '...'}
                </div>
              </div>
            )}
            {advancedMode && <RankInfoComponent rankInfo={examObject?.rank} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>各科分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4'>
              {examObject.detail.papers.map((item) => {
                const isDisplayed = displayedPapersMode[item.paperId]

                return isDisplayed ? (
                  <PaperShowingComponent
                    key={item.paperId}
                    paper={item}
                    changeDisplayMode={changeDisplayedMode}
                    examId={examObject.detail.examId}
                  />
                ) : (
                  <PaperHidingComponent
                    changeDisplayMode={changeDisplayedMode}
                    paper={item}
                    key={item.paperId}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className='divide-y pt-10'>
        <div />
        <div className='flex flex-col justify-between pt-2 md:flex-row'>
          <span className='flex items-center text-gray-500 text-xs'>
            Open Source by Roitium on
            <span className='ml-1 inline-flex items-center'>
              <a
                href='https://github.com/yanyao2333/HFS-NEXT'
                target='_blank'
                className='ml-1'
                rel='noreferrer'
              >
                <GithubSVGIcon />
              </a>
              <a
                href='https://github.com/yanyao2333/HFS-NEXT'
                target='_blank'
                className='ml-1 underline'
                rel='noreferrer'
              >
                yanyao2333/HFS-NEXT
              </a>
            </span>
          </span>
          <span className='content-center text-gray-500 text-xs'>
            Powered by{' '}
            <a
              href='https://vercel.com'
              target='_blank'
              className='underline'
              rel='noreferrer'
            >
              Vercel
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}
