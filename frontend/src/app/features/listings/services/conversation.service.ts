import { CreateConversationDto } from "@/features/auth/models/conversation.model";
import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private readonly http = inject(HttpClient);

  private readonly endpoint = `${environment.apiUrl}/api/conversation`;

  create(data: CreateConversationDto): Observable<any> {
    return this.http.post(this.endpoint, data);
  }
}