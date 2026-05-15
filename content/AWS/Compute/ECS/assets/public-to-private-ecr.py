from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import ECS, ECR, EKS
from diagrams.aws.security import SecretsManager, IAMRole
from diagrams.aws.general import InternetAlt1, InternetAlt2
from diagrams.aws.network import InternetGateway
from diagrams.onprem.container import Docker

OUTPUT = "/home/kumail/Devops-Dojo/Documetations/Opscatalyst/content/AWS/Compute/ECS/assets/public-to-private-ecr"

with Diagram(
    "Public to Private ECR - Pull Through Cache",
    filename=OUTPUT,
    show=False,
    direction="LR",
    graph_attr={
        "bgcolor": "white",
        "pad": "0.5",
        "fontsize": "14",
        "fontname": "Helvetica",
    },
    node_attr={
        "fontsize": "11",
        "fontname": "Helvetica",
    },
):
    with Cluster("Public Registries"):
        docker_hub = Docker("Docker Hub\nregistry-1.docker.io")
        ecr_public = ECR("ECR Public\npublic.ecr.aws")

    with Cluster("AWS Account"):
        secrets = SecretsManager("Secrets Manager\n(Hub Credentials)")

        with Cluster("ECR Pull Through Cache"):
            ecr_cache = ECR("Private ECR\n(Cached Images)")

        with Cluster("Workload"):
            ecs = ECS("ECS / EKS\nWorkload")

    # Pull flows - cache miss fetches from upstream
    docker_hub >> Edge(label="cache miss", style="dashed", color="#E67E22") >> ecr_cache
    ecr_public >> Edge(label="cache miss", style="dashed", color="#E67E22") >> ecr_cache

    # Secrets used for Docker Hub auth
    secrets >> Edge(label="auth", style="dashed", color="#DD344C") >> ecr_cache

    # Workload pulls from cache
    ecs >> Edge(label="docker pull") >> ecr_cache

print(f"Diagram saved to {OUTPUT}.png")
