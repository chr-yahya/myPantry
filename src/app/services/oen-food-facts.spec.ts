import { TestBed } from '@angular/core/testing';

import { OenFoodFacts } from './oen-food-facts';

describe('OenFoodFacts', () => {
  let service: OenFoodFacts;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OenFoodFacts);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
