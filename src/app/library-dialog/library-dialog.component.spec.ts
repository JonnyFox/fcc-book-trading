import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryDialogComponent } from './library-dialog.component';

describe('LibraryDialogComponent', () => {
  let component: LibraryDialogComponent;
  let fixture: ComponentFixture<LibraryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
