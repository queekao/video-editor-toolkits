package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsecr"
	"github.com/aws/jsii-runtime-go"
)

func createEcrRepository(stack awscdk.Stack) awsecr.Repository {
	repo := awsecr.NewRepository(stack, jsii.String("MyRepository"), &awsecr.RepositoryProps{
		RepositoryName: jsii.String("test"),
	})
	return repo
}

// func createEcsService(stack awscdk.Stack, cluster awsecs.Cluster, repo awsecr.Repository) awsecs.FargateService {
//     taskDefinition := awsecs.NewFargateTaskDefinition(stack, jsii.String("MyTaskDef"), nil)
//     container := taskDefinition.AddContainer(jsii.String("myContainer"), &awsecs.ContainerDefinitionOptions{
//         Image: awsecs.ContainerImage_FromEcrRepository(repo, "latest"),
//         MemoryLimitMiB: jsii.Number(512),
//         Cpu: jsii.Number(256),
//     })

//     service := awsecs.NewFargateService(stack, jsii.String("MyService"), &awsecs.FargateServiceProps{
//         Cluster: cluster,
//         TaskDefinition: taskDefinition,
//     })
//     return service
// }
