#!/usr/bin/env bash
set -e

# A helper script to easily run queries / log-in to the Dockerized redis containers
# ./bin/redis.sh \"[target]\" \"[command]\"

TARGET="${1:-dev}"
[[ -n $1 ]] && shift

function bashcmd {
  if [[ "${TARGET}" == "dev" ]]; then
    POD_NAME="$(kubectl get pods -l app=redis -o name | awk -F'/' '{print $2}')"
    [[ -z $POD_NAME ]] && {
      echo -e "No redis pod in current context" && exit 1
    }
    shift
    kubectl exec -it "${POD_NAME}" -- "$@"
  fi
}

bashcmd "${TARGET}" redis-cli "$@"
