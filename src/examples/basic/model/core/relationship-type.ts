/**
 * The types of relationships supported. Each of these are related to
 * key design principles when modelling data schemas.
 */
export enum RelationshipType {
  /**
   * Represents if some entity B is part of A, and cannot exist without A.
   */
  COMPOSED_OF = 'composedOf',
  /**
   * Represents if entity B is part of A, and can exist independently of A.
   */
  AGGREGATED_BY = 'aggregatedBy',
  /**
   * Represents if entity B uses A, and can exist independently of A.
   */
  ASSOCIATED_WITH = 'associatedWith',
}
