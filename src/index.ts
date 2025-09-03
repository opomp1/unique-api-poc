import { swagger } from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import { employeeRoutes } from './features/borrowing/employee.route';
import { reservationRoutes } from './features/reservation/reservation.route';

const app = new Elysia()
  .use(
    swagger({
      path: '/docs',
    })
  )
  .get('/', () => 'Hello Elysia')
  .use(employeeRoutes)
  .use(reservationRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
