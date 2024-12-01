import { Identifiable } from './identifiable';
import { Relationship } from './relationship';
import { RelationshipType } from './relationship-type';

/**
 * An aggregation -> B is part of A, but can exist independent of A.
 */
export interface AggregatedBy<Entity extends Identifiable = Identifiable>
  extends Relationship {
  /**
   * Relationship type of an aggregation.
   */
  type: RelationshipType.AGGREGATED_BY;
  /**
   * Relationship entity.
   */
  entities: Entity[];
}
