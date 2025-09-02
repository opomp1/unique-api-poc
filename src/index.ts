import { swagger } from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import { borrowingRoutes } from './features/borrowing/borrowing.route';

const app = new Elysia()
  .use(
    swagger({
      path: '/docs',
    })
  )
  .get('/', () => 'Hello Elysia')
  .use(borrowingRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
