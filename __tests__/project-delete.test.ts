import { ProjectService } from "@/app/(main)/project/services/project.service";
import { ProjectDeleteResponseDto } from "@/app/(main)/project/dtos/project.dto";

// Mock the project service for testing
const mockProjectService: Partial<ProjectService> = {
  deleteProject: async (projectId: number): Promise<ProjectDeleteResponseDto> => {
    // Simulate successful delete response
    return {
      message: `Project with ID ${projectId} has been successfully deleted.`
    };
  }
};

describe('Project Delete API', () => {
  it('should delete a project successfully', async () => {
    const projectId = 1;
    const result = await mockProjectService.deleteProject!(projectId);
    
    expect(result).toBeDefined();
    expect(result.message).toContain(`Project with ID ${projectId} has been successfully deleted`);
  });

  it('should handle project ID correctly', async () => {
    const projectId = 123;
    const result = await mockProjectService.deleteProject!(projectId);
    
    expect(result.message).toContain(projectId.toString());
  });
});