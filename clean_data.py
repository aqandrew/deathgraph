"""
Condense Healthbank.org US mortality data from 1980-2014 into a file that's compatible with a JS streamgraph.
"""

from os import listdir
from os.path import isdir, join
import csv


def main():
  output_filename = 'death_data.csv'
  directory = 'data'
  directory_files = sorted(listdir(directory))  
  output_lines = []

  # Open all subdirectories
  for subdirectory_index, subdirectory_name in enumerate([f for f in directory_files if isdir(join(directory, f))]):
    print 'Subdirectory: ' + subdirectory_name

    # Assume no subsubdirectories...
    subdirectory_files = sorted(listdir(join(directory, subdirectory_name)))
    current_location_death = ()

    # Open all files within each subdirectory
    for subfile_index, subdirectory_filename in enumerate([n for n in subdirectory_files if n != '.DS_Store']):
      print '\tData file: ' + subdirectory_filename
      
      with open(join(directory, subdirectory_name, subdirectory_filename), 'r') as data_file:
        csv_reader = csv.reader(data_file)

        # Write relevant lines to output file
        for line_index, row in enumerate(csv_reader):
          # Write header line to output file
          if subdirectory_index == 0 and subfile_index == 0 and line_index == 0:
            output_lines.append(trim_row(row))

          # Skip header row
          # We only want data for both genders
          if line_index != 0 and int(row[5]) == 3:
            location_death = (row[2], row[3])
          
            # Write first 4 columns only once for each location/COD, to reduce filesize < 100 MB
            if location_death != current_location_death:
              output_lines.append(trim_row(row))
              current_location_death = location_death
            else:
              output_lines.append([''] * 4 + row[7:9])


  # Write cleaned data to a new file
  with open(output_filename, 'w') as output_file:
    csv_writer = csv.writer(output_file)

    for data_line in output_lines:
      csv_writer.writerow(data_line)


# Obtain only columns of interest from a data row
def trim_row(row):
  temp_row = []

  unwanted_col_nums = [
    0, # Location ID
    5, # Sex ID
    6, # Sex
    9, # 95% Uncertainty Interval - Lower Bound
    10 # 95% Uncertainty Interval - Upper Bound
  ]

  for col_index, column in enumerate(row):
    if col_index not in unwanted_col_nums:
      temp_row.append(column)
  
  return temp_row


if __name__ == '__main__':
  main()