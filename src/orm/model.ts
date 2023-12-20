export enum ModelName {
  Danger = 'danger',
  File = 'file',
  FdsFile = 'fdsFile',
  Substance = 'substance',
  SubstanceDanger = 'substanceDanger',
  Product = 'product',
  ProductSubstance = 'productSubstance',
  ProductSubstanceDanger = 'ProductSubstanceDanger',
  ProductDanger = 'productDanger',
}

export const TableName: { [model in ModelName]: string } = {
  [ModelName.Danger]: 'danger',
  [ModelName.File]: 'file',
  [ModelName.FdsFile]: 'fds_file',
  [ModelName.Substance]: 'substance',
  [ModelName.SubstanceDanger]: 'substance_danger',
  [ModelName.Product]: 'product',
  [ModelName.ProductSubstance]: 'product_substance',
  [ModelName.ProductSubstanceDanger]: 'product_substance_danger',
  [ModelName.ProductDanger]: 'product_danger',
};
