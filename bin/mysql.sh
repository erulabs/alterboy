#!/usr/bin/env bash
set -e
DATABASE_TYPE="mysql"

[[ -f '.env' ]] && source '.env'
[[ -n $1 ]] && shift

function bashcmd {
  POD_NAME="$(kubectl get pods -l app=${DATABASE_TYPE} -o name | awk -F'/' '{print $2}')"
  [[ -z $POD_NAME ]] && {
    echo -e "No pod in current context" && exit 1
  }
  shift
  kubectl exec -it "${POD_NAME}" -- "$@"
}
set -x

bashcmd "${TARGET}" "${DATABASE_TYPE}" -u "${MYSQL_USERNAME}" --password="${MYSQL_PASSWORD}" "${MYSQL_DATABASE}"
