FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY webapp/package.json ./webapp/package.json
COPY server/package.json ./server/package.json
COPY .npmrc ./.npmrc

RUN npm ci --workspaces --include-workspace-root --include=dev --no-audit --prefer-offline

COPY . .

RUN npm run build
RUN npm prune --omit=dev --workspaces --include-workspace-root

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/webapp/package.json ./webapp/package.json
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server
COPY --from=build /app/webapp/dist ./webapp/dist
COPY --from=build /app/shared ./shared

EXPOSE 8080

CMD ["npm", "run", "start"]