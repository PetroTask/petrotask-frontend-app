import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TeamMember } from '../models/team-member.entity';
import { TeamMemberResource, CreateTeamMemberResource } from '../models/team.resource';
import { TeamMemberAssembler } from '../mappers/team-member.assembler';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {
  private baseUrl = `${environment.apiBaseUrl}/teams`;

  constructor(private http: HttpClient) {}

  addTeamMemberToTeam(teamId: number, teamMember: TeamMember): Observable<TeamMember> {
    const createResource = TeamMemberAssembler.toResourceFromEntity(teamMember);
    return this.http.post<TeamMemberResource>(`${this.baseUrl}/teams/${teamId}/members`, createResource).pipe(
      map(resource => TeamMemberAssembler.toEntityFromResource(resource))
    );
  }

  getTeamMemberById(id: number): Observable<TeamMember> {
    return this.http.get<TeamMemberResource>(`${this.baseUrl}/members/${id}`).pipe(
      map(resource => TeamMemberAssembler.toEntityFromResource(resource))
    );
  }

  deleteTeamMember(teamId: number, memberId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/teams/${teamId}/members/${memberId}`);
  }
}
