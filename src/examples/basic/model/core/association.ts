import { Identifiable } from './identifiable';
import { RelationshipType } from './relationship-type';

/**
 * An association -> B uses A, and can exist independent of A.
 */
export interface AssociatedWith<Entity extends Identifiable = Identifiable> {
  /**
   * Relationship type of an association.
   */
  type: RelationshipType.ASSOCIATED_WITH;
  /**
   * ID of the entity instance it is related to.
   */
  id: Entity['id'];
}
