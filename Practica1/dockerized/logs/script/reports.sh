#!/usr/bin/env bash

FILE="/log_file/main.log"
if test -f $FILE; then
    echo "$FILE found, reading..."
else
    echo "$FILE file not found, no logs to read :("
    exit 1;
fi



line="                            "
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
###########################################################################################
LOG_RESULT="$(sed -n '$=' $FILE)"
if [[ $LOG_RESULT ]]; then
    :
else
    LOG_RESULT="0"
fi
LOG_OUTPUT="$(printf "%sNo# Operations:%s%s"$LOG_RESULT)"
printf "~~ %s %s~~\n" "$LOG_OUTPUT" "${line:${#LOG_OUTPUT}}"
###########################################################################################
LOG_RESULT="$(cat $FILE |grep "Error"  | sed -n '$=')"
if [[ $LOG_RESULT ]]; then
    :
else
    LOG_RESULT="0"
fi

LOG_OUTPUT="$(printf "%sNo# Operations with error:%s%s"$LOG_RESULT)"
printf "~~ %s %s~~\n" "$LOG_OUTPUT" "${line:${#LOG_OUTPUT}}"
###########################################################################################
LOG_RESULT="$(cat $FILE |grep "Operator:+"  | sed -n '$=')"
if [[ $LOG_RESULT ]]; then
    :
else
    LOG_RESULT="0"
fi
LOG_OUTPUT="$(printf "%sNo# Operations with +:%s%s"$LOG_RESULT)"
printf "~~ %s %s~~\n" "$LOG_OUTPUT" "${line:${#LOG_OUTPUT}}"
###########################################################################################
LOG_RESULT="$(cat $FILE |grep "Operator:-"  | sed -n '$=')"
if [[ $LOG_RESULT ]]; then
    :
else
    LOG_RESULT="0"
fi
LOG_OUTPUT="$(printf "%sNo# Operations with -:%s%s"$LOG_RESULT)"
printf "~~ %s %s~~\n" "$LOG_OUTPUT" "${line:${#LOG_OUTPUT}}"
###########################################################################################
LOG_RESULT="$(cat $FILE |grep "Operator:\*"  | sed -n '$=')"
if [[ $LOG_RESULT ]]; then
    :
else
    LOG_RESULT="0"
fi
LOG_OUTPUT="$(printf "%sNo# Operations with *:%s%s"$LOG_RESULT)"
printf "~~ %s %s~~\n" "$LOG_OUTPUT" "${line:${#LOG_OUTPUT}}"
###########################################################################################
LOG_RESULT="$(cat $FILE |grep "Operator:/"  | sed -n '$=')"
if [[ $LOG_RESULT ]]; then
    :
else
    LOG_RESULT="0"
fi
LOG_OUTPUT="$(printf "%sNo# Operations with /:%s%s"$LOG_RESULT)"
printf "~~ %s %s~~\n" "$LOG_OUTPUT" "${line:${#LOG_OUTPUT}}"
###########################################################################################

echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

echo "Today logs:"
cat $FILE | grep "$(date +"%Y-%m-%d")"
