"""
Condense data for each cause of death into a two-column CSV: year and mortality rate, as an average of each state's mortality rate.

The input file, death_data_states, is the original dataset, but only including rows for states' mortality rates--not those of counties.
"""


from os.path import isdir, join
import csv
import operator


directory = 'data'
input_filename = 'death_data_states.csv'
output_filename = 'death_data_annual.csv'


def main():
  cause_year_values = {}
  death_data_annual = []

  # We want to iterate through the death data multiple times, as inefficient as that is. So we store the data in death_data_annual
  with open(join(directory, input_filename), 'r') as input_file:
    csv_reader = csv.reader(input_file)
    for row in csv_reader:
      death_data_annual.append(row)

  # Average together mortality rates for all 50 states
  for line_index, death_stat in enumerate(death_data_annual):
    if line_index != 0:
      adding_value = float(death_stat[5]) / 50
      # Keys are (cause_of_death, year)
      dict_key = (death_stat[3], int(death_stat[4]))

      if dict_key in cause_year_values:
        cause_year_values[dict_key] += adding_value
      else:
        cause_year_values[dict_key] = 0

  # Write cleaned data to a new file
  with open(join(directory, output_filename), 'w') as output_file:
    csv_writer = csv.writer(output_file)
    # Write header row
    csv_writer.writerow(['year', 'cause_of_death', 'mortality_rate'])

    # Ensure data is listed in order of year, then alphabetically by cause of disease
    for cause_year in sorted(cause_year_values, key=operator.itemgetter(0, 1)):
      csv_writer.writerow([cause_year[1], cause_year[0], cause_year_values[cause_year]])


if __name__ == '__main__':
  main()