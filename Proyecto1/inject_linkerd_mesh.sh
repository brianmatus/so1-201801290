#!/usr/bin/env bash


kubectl get -n so1 deploy -o yaml | linkerd inject - | kubectl apply -f -