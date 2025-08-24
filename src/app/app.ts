import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('trainee-tests-app');
  protected readonly router = new Router();

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
