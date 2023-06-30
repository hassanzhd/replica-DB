interface PrimaryKeyColumnProps {
    name: string
}

export class PrimaryKeyColumn {
    public name: string;

  private constructor(props: PrimaryKeyColumnProps) {
    this.name = props.name;
  }

  public static create(name: string): PrimaryKeyColumn {
    return new PrimaryKeyColumn({ name });
  }
}