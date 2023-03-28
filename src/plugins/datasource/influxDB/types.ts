export interface InfluxDBBaseParams {
  cate: string;
  cluster: string;
}

export interface InfluxDBMeasureParams extends InfluxDBBaseParams {
  dbname: string;
}

export interface InfluxDBTagFieldParams extends InfluxDBMeasureParams {
  measurement: string;
  retentionpolicy: string;
}

export interface InfluxDBQueryParams extends InfluxDBBaseParams {
  query: {
    dbname: string;
    start: number;
    end: number;
    command: string;
  }[];
}

export interface InfluxDBQueryResult {
  metric: {
    [key: string]: string;
  };
  values: [number, number][];
}
