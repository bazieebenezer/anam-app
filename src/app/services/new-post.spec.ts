import { TestBed } from '@angular/core/testing';

import { NewPost } from './new-post';

describe('NewPost', () => {
  let service: NewPost;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewPost);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
