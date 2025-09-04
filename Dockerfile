FROM oven/bun:latest AS dependencies
WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

FROM dependencies AS build

COPY . .

RUN bun run build

FROM oven/bun AS final
COPY --from=build /app/dist dist
COPY --from=build /app/src/font/ src/font/
RUN ls -al 

EXPOSE 3000

CMD [ "bun", "run", "dist/index.js" ]