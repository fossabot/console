import { Component, Input, Injector, OnInit, OnDestroy } from '@angular/core';
import { Environment } from '../../../shared/datamodel/k8s/environment';
import { ComponentCommunicationService } from '../../../shared/services/component-communication.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'environment-card',
  templateUrl: './environment-card.component.html',
  styleUrls: ['./../workspace-overview/workspace-overview.component.scss'],
  host: { '[class]': 'hostClasses' }
})
export class EnvironmentCardComponent implements OnInit, OnDestroy {
  @Input() entry: Environment;

  hostClasses = 'col-md-6 col-lg-4';

  entryEventHandler;

  actions = [
    {
      function: 'delete',
      name: 'Delete'
    }
  ];

  constructor(
    protected injector: Injector,
    private componentCommunicationService: ComponentCommunicationService
  ) {
    this.entry = this.injector.get('entry');
    this.entryEventHandler = this.injector.get('entryEventHandler');
  }
  public disabled = false;
  private communicationServiceSubscription: Subscription;

  ngOnInit() {
    this.communicationServiceSubscription = this.componentCommunicationService.observable$.subscribe(
      e => {
        const event: any = e;
        if ('disable' === event.type && this.entry.spec === event.entry.spec) {
          this.disabled = event.entry.disabled;
        }
      }
    );
  }

  ngOnDestroy() {
    this.communicationServiceSubscription.unsubscribe();
  }
}
