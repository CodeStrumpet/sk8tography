#!/usr/bin/env python

# Imports
import os, subprocess, argparse, traceback, time, datetime, json




# *****************************************************
# Command Line Arguments
# *****************************************************

parser = argparse.ArgumentParser(description = 'splits video into separate files based on scene boundaries')
parser.add_argument('-input', action="store", dest="input", default=None, required=True, help="video to process")
parser.add_argument('-output', action="store", dest="output", default="./", help="directory in which to place individual shot files")

# parse command line arguments and place in 'args' variable
args = parser.parse_args()


# *****************************************************
# Create variable for response
# *****************************************************
response = {}


# *****************************************************
# FS Path management
# *****************************************************

# expand input file to absolute path
input_path = os.path.abspath(args.input)
input_head, input_tail = os.path.split(input_path)
input_base_name, input_ext = os.path.splitext(input_tail)

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

timestamps = []

ffprobe_command = "ffprobe -show_frames -of compact=p=0 -f lavfi 'movie=" + input_path + ",select=gt(scene\,.4)'  | awk -F'|' '{print $4}' | awk -F'=' '{print $2}'"

ffprobe_output_file = open("ffprobe.out", "w+")

ffprobe_status = subprocess.call(ffprobe_command, shell=True, stdout=ffprobe_output_file)

if (ffprobe_status == 0): 
    ffprobe_output_file.seek(0)
    timestamps = ffprobe_output_file.readlines()
    response["num_timestamps"] = len(timestamps)
    #print "ffprobe call succeeded.  number of timestamps: " + str(len(timestamps))
else:
    response["error"] = "ffprobe call failed w/ status: " + str(ffprobe_status)
    #print "ffprobe call failed w/ status: " + str(ffprobe_status)
    
# clean up temp files
file_to_delete = ffprobe_output_file.name
ffprobe_output_file.close()
os.remove(file_to_delete)


# *****************************************************
# Iterate through boundary timestamps and create clips
# *****************************************************

# create array to push info for each clip
output_info = []

num_timestamps = len(timestamps)
for index, timestamp in enumerate(timestamps):

    clip_info = {}
        
    # get start_time and end_time for the clip
    start_time = float(timestamp)


    if (index + 1 < num_timestamps):
        duration = float(timestamps[index+1]) - start_time
    else:
        duration = -1
    
    
    if (duration == -1):
        duration_arg = ""
    else:
        duration_arg = " -t " + str(duration)        
        
    output_name = output_path + "/" + input_base_name + "_" + str(index) + input_ext

    clip_info['start'] = start_time
    clip_info['duration'] = duration
    clip_info['name'] = input_base_name + "_" + str(index) + input_ext
    output_info.append(clip_info)

    split_command = "ffmpeg -ss " + str(start_time) + " -i " + input_path + " -vcodec copy -acodec copy" + duration_arg + " " + output_name
    
    split_status = subprocess.call(split_command, shell=True)
    clip_info['split_status'] = split_status

response["timestamps"] = output_info

output_string = json.dumps(response)
print output_string