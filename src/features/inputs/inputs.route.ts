import Elysia from 'elysia';

export const inputsRoutes = new Elysia({
  prefix: '/inputs',
  tags: ['Input'],
}).get(
  '/',
  () => {
    return {
      date: '12',
      month: '09',
      year: '2025',
      name: 'นาย ทองดี ทองเค',
      department: 'IT Support',
      project: 'โครงการพัฒนาชุมชน',
      MyTable:
        '[["เงินเดือน","รายรับ","25,000"],["ค่าอาหารกลางวัน","รายจ่าย","-60"],["ค่าเดินทาง","รายจ่าย","-100"]]',
      field10: true,
      'field10 copy': false,
    };
  },
  {}
);
