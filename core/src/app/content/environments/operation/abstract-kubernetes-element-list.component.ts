import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { InformationModalComponent } from '../../../shared/components/information-modal/information-modal.component';
import { JsonEditorModalComponent } from '../../../shared/components/json-editor-modal/json-editor-modal.component';
import { ComponentCommunicationService } from '../../../shared/services/component-communication.service';
import { CurrentEnvironmentService } from '../../environments/services/current-environment.service';
import {
  ChangeDetectorRef,
  Injectable,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Filter, GenericTableComponent } from '@kyma-project/y-generic-list';
import { ImplicitReceiver } from '@angular/compiler';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class AbstractKubernetesElementListComponent
  extends GenericTableComponent
  implements OnDestroy {
  @ViewChild('confirmationModal') confirmationModal: ConfirmationModalComponent;
  @ViewChild('infoModal') infoModal: InformationModalComponent;
  @ViewChild('editResourceModal') editResourceModal: JsonEditorModalComponent;

  showSelectFileButton = false;
  showSuccessInfo = false;
  filterState = {
    filters: [
      new Filter('metadata.name', '', false),
      new Filter('objectMeta.name', '', false)
    ]
  };
  pagingState = { pageNumber: 1, pageSize: 9999 };
  entryEventHandler = this.getEntryEventHandler();

  public resourceKind: string;
  public title: string;
  public emptyListText: string;
  public createNewElementText: string;
  private communicationServiceSubscription: Subscription;

  constructor(
    private currentEnvSrv: CurrentEnvironmentService,
    private changeDet: ChangeDetectorRef,
    private httpClient: HttpClient,
    private communicationService: ComponentCommunicationService
  ) {
    super(changeDet);
    this.subscribeToRefreshComponent();
  }

  getResourceUrl(kind: string, entry: any): string {
    return null;
  }

  getCurrentEnvironmentId() {
    return this.currentEnvSrv.getCurrentEnvironmentId();
  }

  ngOnDestroy() {
    this.communicationServiceSubscription.unsubscribe();
  }

  getEntryEventHandler() {
    return {
      delete: (entry: any) => {
        this.confirmationModal
          .show(
            'Confirm delete',
            'Do you really want to delete ' +
              (entry.name || entry.getName()) +
              '?'
          )
          .then(() => {
            entry.disabled = true;
            this.communicationService.sendEvent({
              type: 'disable',
              entry
            });
            this.httpClient
              .delete(
                this.getResourceUrl(this.resourceKind.toLowerCase(), entry)
              )
              .subscribe(
                () => {
                  setTimeout(() => {
                    this.communicationService.sendEvent({
                      type: 'deleteResource',
                      data: entry
                    });
                  }, 275);
                },
                error => {
                  entry.disabled = false;
                  this.communicationService.sendEvent({
                    type: 'disable',
                    entry
                  });
                  this.infoModal.show(
                    'Error',
                    'There was an error trying to delete ' +
                      (entry.name || entry.getName()) +
                      ': ' +
                      (error.message || error)
                  );
                  this.reload();
                }
              );
          });
      },
      edit: (entry: any) => {
        this.httpClient
          .get(this.getResourceUrl(this.resourceKind.toLowerCase(), entry))
          .subscribe(
            res => {
              this.editResourceModal.resourceData = res;
              this.editResourceModal.show();
            },
            error => {
              console.log(
                'Error loading resource: ' + (error.message || error)
              );
            }
          );
      }
    };
  }

  subscribeToRefreshComponent() {
    this.communicationServiceSubscription = this.communicationService.observable$.subscribe(
      e => {
        const event: any = e;

        switch (event.type) {
          case 'updateResource':
            return this.reload();
          case 'createResource':
            this.showSuccessInfo = true;
            return this.reload();
          case 'disable':
            return;
          default:
            this.reload();
        }
      }
    );
  }
}
