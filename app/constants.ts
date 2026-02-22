export const HFS_APIs = {
  login: 'https://hfs-be.yunxiao.com/v2/users/sessions',
  userSnapshot: 'https://hfs-be.yunxiao.com/v2/user-center/user-snapshot',
  examList: 'https://hfs-be.yunxiao.com/v2/wrong-items/overview',
  examOverview: 'https://hfs-be.yunxiao.com/v3/exam/${examId}/overview',
  examRankInfo: 'https://hfs-be.yunxiao.com/v3/exam/${examId}/rank-info',
  answerPicture:
    'https://hfs-be.yunxiao.com/v3/exam/${examId}/papers/${paperId}/answer-picture?pid=${pid}',
  paperRankInfo:
    'https://hfs-be.yunxiao.com/v3/exam/${examId}/papers/${paperId}/rank-info',
  lastExamOverview: 'https://hfs-be.yunxiao.com/v2/students/last-exam-overview',
  examOverviewV4: 'https://hfs-be.yunxiao.com/v4/exam/overview',
}
