import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowDetailsComponent } from './row-details.component';

describe('RowDetailsComponent', () => {
  let component: RowDetailsComponent<T>;
  let fixture: ComponentFixture<RowDetailsComponent<T>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RowDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RowDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
