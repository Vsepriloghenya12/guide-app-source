FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY .npmrc ./.npmrc
COPY webapp/package.json ./webapp/package.json
COPY server/package.json ./server/package.json

RUN npm ci --workspaces --include-workspace-root --include=dev --no-audit --prefer-offline

FROM node:18-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/webapp/package.json ./webapp/package.json
COPY --from=deps /app/server/package.json ./server/package.json
COPY . .

RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
COPY .npmrc ./.npmrc
COPY webapp/package.json ./webapp/package.json
COPY server/package.json ./server/package.json

RUN npm ci --workspaces --include-workspace-root --omit=dev --no-audit --prefer-offline

COPY --from=build /app/server ./server
COPY --from=build /app/webapp/dist ./webapp/dist
COPY --from=build /app/shared ./shared

EXPOSE 8080

CMD ["npm", "run", "start"]