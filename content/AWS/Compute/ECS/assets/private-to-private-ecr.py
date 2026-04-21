from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import ECS, ECR, EKS
from diagrams.aws.security import SecretsManager, IAMRole
from diagrams.aws.management import Organizations

OUTPUT = "/home/kumail/Devops-Dojo/Documetations/Opscatalyst/content/AWS/Compute/ECS/assets/private-to-private-ecr"

with Diagram(
    "Private to Private ECR - Pull Through Cache",
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
    with Cluster("Platform Account\n(123456789)"):
        ecr_source = ECR("Private ECR\nBase Images\n123456789.dkr.ecr.*")
        iam_policy = IAMRole("Registry Policy\n(grants cross-acct pull)")

    with Cluster("Workload Account\n(987654321)"):
        with Cluster("ECR Pull Through Cache"):
            ecr_cache = ECR("Private ECR\nCached Images\n987654321.dkr.ecr.*")

        with Cluster("Workload"):
            ecs = ECS("ECS / EKS\nWorkload")

    # Cross-account cache miss fetch
    ecr_source >> Edge(label="cache miss\n(cross-account fetch)", style="dashed", color="#E67E22") >> ecr_cache

    # IAM policy enables the pull
    iam_policy >> Edge(label="allows BatchGetImage\nGetDownloadUrlForLayer", style="dotted", color="#DD344C") >> ecr_cache

    # Workload pulls from local cache
    ecs >> Edge(label="docker pull\n(local cache hit)") >> ecr_cache

print(f"Diagram saved to {OUTPUT}.png")
