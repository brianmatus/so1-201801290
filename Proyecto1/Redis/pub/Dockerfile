# syntax=docker/dockerfile:1
#Version golang
FROM golang:1.20
WORKDIR /app


COPY go.mod ./
COPY go.sum ./

RUN go mod download

COPY main.go ./
COPY .env.local ./

RUN go build -o /backend/

CMD ["/backend/pub"]



