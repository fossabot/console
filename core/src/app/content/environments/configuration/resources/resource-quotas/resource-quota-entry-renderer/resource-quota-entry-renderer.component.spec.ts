import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceQuotaEntryRendererComponent } from './resource-quota-entry-renderer.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentCommunicationService } from '../../../../../../shared/services/component-communication.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

describe('ResourceQuotasEntryRendererComponent', () => {
  let component: ResourceQuotaEntryRendererComponent;
  let fixture: ComponentFixture<ResourceQuotaEntryRendererComponent>;
  let componentCommunicationService: ComponentCommunicationService;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ResourceQuotaEntryRendererComponent],
        providers: [
          ComponentCommunicationService,
          {
            provide: 'entry',
            useValue: {
              name: 'name',
              pods: '3',
              limits: {
                memory: '1',
                cpu: '1'
              },
              requests: {
                memory: '1',
                cpu: '1'
              }
            }
          },
          { provide: 'entryEventHandler', useValue: {} }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceQuotaEntryRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    componentCommunicationService = TestBed.get(ComponentCommunicationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set disabled to true if disable event has been sent', async () => {
      const subject = new Subject();
      const entry = {
        name: 'name',
        disabled: true
      };
      spyOn(componentCommunicationService, 'observable$').and.returnValue(
        Observable.of(subject.next(entry))
      );
      fixture.whenStable().then(async () => {
        fixture.detectChanges();
        await componentCommunicationService.sendEvent({
          type: 'disable',
          entry
        });
        expect(component.disabled).toEqual(true);
      });
    });

    it('should set disabled to false if disable event with disable property set to false, has been sent', async () => {
      const subject = new Subject();
      const entry = {
        name: 'name',
        disabled: false
      };
      spyOn(componentCommunicationService, 'observable$').and.returnValue(
        Observable.of(subject.next(entry))
      );
      fixture.whenStable().then(async () => {
        fixture.detectChanges();
        await componentCommunicationService.sendEvent({
          type: 'disable',
          entry
        });
        expect(component.disabled).toEqual(false);
      });
    });

    it("shouldn't do anything if event sent has diffetent type than disable", async () => {
      const subject = new Subject();
      const entry = {
        name: 'name',
        disabled: true
      };
      spyOn(componentCommunicationService, 'observable$').and.returnValue(
        Observable.of(subject.next(entry))
      );
      fixture.whenStable().then(async () => {
        fixture.detectChanges();
        await componentCommunicationService.sendEvent({
          type: 'other',
          entry
        });
        expect(component.disabled).toEqual(false);
      });
    });

    it("shouldn't do anything if event sent corresponds to different entry", async () => {
      const subject = new Subject();
      const entry = {
        name: 'differentName',
        disabled: true
      };
      spyOn(componentCommunicationService, 'observable$').and.returnValue(
        Observable.of(subject.next(entry))
      );
      fixture.whenStable().then(async () => {
        fixture.detectChanges();
        await componentCommunicationService.sendEvent({
          type: 'disable',
          entry
        });
        expect(component.disabled).toEqual(false);
      });
    });
  });
});
