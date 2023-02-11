# syntax=docker/dockerfile:1
#Version golang
FROM golang:1.20
WORKDIR /app


COPY go.mod ./
COPY go.sum ./

RUN go mod download

COPY main.go ./

RUN go build -o /backend/

EXPOSE 5000
CMD ["/backend/back"]



