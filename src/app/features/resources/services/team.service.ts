import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Team } from '../models/team.entity';
import { TeamMember } from '../models/team-member.entity';
import { TeamResource, CreateTeamResource, TeamMemberResource, CreateTeamMemberResource } from '../models/team.resource';
import { TeamAssembler } from '../mappers/team.assembler';
import { TeamMemberAssembler } from '../mappers/team-member.assembler';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private baseUrl = `${environment.apiBaseUrl}/teams`;

  constructor(private http: HttpClient) {}

  // Team operations
  getAllTeams(): Observable<Team[]> {
    return this.http.get<TeamResource[]>(this.baseUrl).pipe(
      map(resources => resources.map(resource => TeamAssembler.toEntityFromResource(resource)))
    );
  }

  getTeamById(id: number): Observable<Team> {
    return this.http.get<TeamResource>(`${this.baseUrl}/${id}`).pipe(
      map(resource => TeamAssembler.toEntityFromResource(resource))
    );
  }

  createTeam(team: Team): Observable<Team> {
    const createResource = TeamAssembler.toResourceFromEntity(team);
    return this.http.post<TeamResource>(this.baseUrl, createResource).pipe(
      map(resource => TeamAssembler.toEntityFromResource(resource))
    );
  }

  // Team member operations
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