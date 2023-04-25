#!/usr/bin/env bash

#Linkerd and Viz Dashboard
linkerd check --pre
linkerd install --crds | kubectl apply -f -
linkerd install | kubectl apply -f -
linkerd check
linkerd viz install | kubectl apply -f -
linkerd check
#linkerd viz dashboard

#Nginx
nginx-meshctl deploy


#Proyecto So1
kubectl apply -f k-namespace.yaml
kubectl apply -f k-pod3.yaml -f k-pod4.yaml


read -s -k "Press any key when MySQL is configured..."

kubectl apply -f k-pod5.yaml -f k-pod1.yaml -f k-pod2.yaml -f k-target-svc.yaml -f k-gateway.yaml