import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UsernnameComponent } from './components/usernname/usernname.component';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from './containers/chat/chat.component';
import { MsngrComponent } from './containers/msngr/msngr.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    UsernnameComponent,
    ChatComponent,
    MsngrComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
