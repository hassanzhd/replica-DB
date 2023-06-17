interface ColumnMetaDataProps {
  name: string;
  type: string;
}

export class ColumnMetaData {
  public name: string;
  public type: string;

  private constructor(props: ColumnMetaDataProps) {
    this.name = props.name;
    this.type = props.type;
  }

  public static create(name: string, type: string): ColumnMetaData {
    return new ColumnMetaData({ name, type });
  }
}
