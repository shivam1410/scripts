#!/usr/bin/bash

#echo $1 $2
printf "compiling...\n\n"
gcc $1.c -o $1 $2
printf "compiling finished."
printf "\n\n"
printf "running...\n\n"
./$1
printf "\n"
