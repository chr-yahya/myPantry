import { TestBed } from '@angular/core/testing';

import { Mypantry } from '../mypantry';

describe('Mypantry', () => {
  let service: Mypantry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Mypantry);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
