# deathgraph

Authors:
- Andrew Aquino
- Brendan Forbes

Streamgraph of US mortality statistics from 1980-2014.

Final project for RPI CSCI-4550 Interactive Visualization, Spring 2018.

Data source: [healthdata.org](http://ghdx.healthdata.org/record/united-states-mortality-rates-county-1980-2014) > Files > Annual, By Sex

## Notes

We reduced the data to 222.4 MB from 1.09 GB, removing information such as mortality rates split by sex, and upper and lower bounds on mortality for a 95% uncertainty interval.

The data was reduced even further to 79.8 MB, by removing repeated information between mortality statistics for the same state/county and cause of death.

In the data:
- FIPS is a numerical code for a state or county.
- "mx" is the mortality rate for a given cause.