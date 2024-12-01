import { Identifiable } from './identifiable';
import { Relationship } from './relationship';
import { RelationshipType } from './relationship-type';

/**
 * A composition -> B is part of A, and cannot exist independent of A.
 */
export interface ComposedOf<Entity extends Identifiable = Identifiable>
  extends Relationship {
  /**
   * Relationship type of an composition.
   */
  type: RelationshipType.COMPOSED_OF;
  /**
   * Relationship entity.
   */
  entities: Entity[];
}
