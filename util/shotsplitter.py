#!/usr/bin/env python

# Imports
import os, subprocess, argparse, traceback, time, datetime




# *****************************************************
# Command Line Arguments
# *****************************************************

parser = argparse.ArgumentParser(description = 'splits video into separate files based on scene boundaries')
parser.add_argument('-input', action="store", dest="input", default=None, required=True, help="video to process")
parser.add_argument('-output', action="store", dest="output", default="./", help="directory in which to place individual shot files")

# parse command line arguments and place in 'args' variable
args = parser.parse_args()


# *****************************************************
# FS Path management
# *****************************************************

# expand input file to absolute path
input_path = os.path.abspath(args.input)

# quit if input file doesn't exist
if not os.path.exists(input_path):
    sys.exit()

# expand output file to absolute path
output_path = os.path.abspath(args.output)

# create output directory if it doesn't exist
if not os.path.exists(output_path):
    os.makedirs(data_dir)





# *****************************************************
# Output shot boundary timestamps
# *****************************************************

# ffprobe -show_frames -of compact=p=0 -f lavfi 'movie=pretty_sweet_20-21.mp4,select=gt(scene\,.4)'  | awk -F'|' '{print $4}' | awk -F'=' '{print $2}'

ffprobe_command = "ffprobe -show_frames -of compact=p=0 -f lavfi 'movie=" + input_path + ",select=gt(scene\,.4)'  | awk -F'|' '{print $4}' | awk -F'=' '{print $2}'"

ffprobe_output_file = open("ffprobe.out", "w+")

ffprobe_status = subprocess.call(ffprobe_command, shell=True, stdout=ffprobe_output_file)

if (ffprobe_status == 0):    
    print "ffprobe call succeeded"
else:
    print "ffprobe call failed w/ status: " + str(ffprobe_status)
    

# clean up temp files
os.remove(ffprobe_output_file.name)





