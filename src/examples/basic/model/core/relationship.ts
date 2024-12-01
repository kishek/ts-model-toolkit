import { Identifiable } from './identifiable';
import { RelationshipType } from './relationship-type';

/**
 * Represents a connection between two entities.
 */
export interface Relationship<RelatedEntity extends Identifiable = Identifiable> {
  /**
   * The type of relationship.
   */
  type: RelationshipType;
  /**
   * The nodes which the current entity is being related to.
   */
  entities: RelatedEntity[];
}
