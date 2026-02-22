'use client'

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { JSX, SVGProps } from 'react'
import toast from 'react-hot-toast'
import Navbar from '@/components/navBar'
import { GithubSVGIcon } from '@/components/svg'
import { useExamListQuery } from '@/hooks/queries'
import { useStorage } from '@/hooks/useStorage'

// 卡片组件
function ExamCard({
  name,
  score,
  released,
  examId,
}: {
  name: string
  score: string
  released: string
  examId: string
  router: AppRouterInstance
}): JSX.Element {
  return (
    <Link
      className='cursor-pointer overflow-hidden rounded-lg border bg-white shadow-md transition-shadow duration-300 hover:shadow-lg dark:bg-gray-900'
      href={`/exam/${examId}`}
    >
      <div className='flex items-center justify-between p-4 md:p-6'>
        <div>
          <h2 className='mb-2 font-semibold text-lg'>{name}</h2>
          <div className='mb-2 flex items-center'>
            <span className='mr-2 text-gray-500'>成绩:</span>
            <span className='font-medium text-gray-800'>{score}</span>
          </div>
          <div className='text-gray-500 text-sm'>发布时间: {released}</div>
        </div>
        <ArrowRightIcon className='h-5 w-5 text-gray-500' />
      </div>
    </Link>
  )
}

export default function ExamSelector() {
  const router = useRouter()
  const [token, setToken] = useStorage('hfs_token')
  const { data: examList, isError, isLoading } = useExamListQuery(token)

  if (!token) {
    toast.error('你还没登录，返回登录页')
    router.push('/login')
  }

  if (isError) {
    toast.error('获取考试列表失败，请稍后再试')
    return null
  }

  return (
    <div className='mx-auto flex min-h-screen select-none flex-col bg-white px-4 pt-6 pb-2 md:px-4 md:pt-6 md:pb-2 dark:bg-gray-900'>
      <Navbar />
      <div className='mt-3 max-w-[600px] self-center rounded-lg bg-sky-400 px-4 py-3 font-medium text-white shadow-md'>
        <div className='flex flex-wrap items-center justify-between'>
          <div className='mr-5 flex flex-1 items-center truncate font-medium'>
            <span className=''>点我查看最新考试排名！</span>
          </div>

          <div className='order-3 mt-2 w-full shrink-0 sm:order-2 sm:mt-0 sm:w-auto'>
            <Link
              href='/results'
              className='flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 font-medium text-black text-sm shadow-xs hover:bg-gray-100'
            >
              点我
            </Link>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className='flex flex-col items-center justify-center py-20'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-sky-500' />
          <p className='mt-4 text-gray-500'>正在加载考试列表...</p>
        </div>
      ) : (
        <div className='grid gap-6 pt-6 md:grid-cols-2 md:pt-6 lg:grid-cols-3 xl:grid-cols-4'>
          {examList?.map((exam) => {
            return (
              <ExamCard
                key={exam.examId}
                name={exam.name}
                score={exam.score}
                released={exam.released}
                examId={exam.examId}
                router={router}
              />
            )
          })}
        </div>
      )}
      <div className='grow' />
      <div className='divide-y pt-10'>
        <div />
        <div className='flex flex-col justify-between pt-0.5 md:flex-row'>
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

function ArrowRightIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <title>向右箭头</title>
      <path d='M5 12h14' />
      <path d='m12 5 7 7-7 7' />
    </svg>
  )
}
