module "gke-cluster" {
  source = "github.com/terraform-google-modules/terraform-google-kubernetes-engine//modules/cluster"
}

resource "google_service_account" "some-account" {
  account_id = "some-account"
  project    = "foo"
}

resource "google_service_account_iam_member" "sa-member" {
  service_account_id = google_service_account.some-account.account_id
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.something-something.name}/attribute.repository/my-github/repository-name"
}

#resource "google_pubsub_topic" "foo" {
#  name = "foo"
#  labels = {
#    foo = "bar"
#  }
#}

# resource "google_pubsub_topic" "foo" {
#  name = "foo"
#  labels = {
#    foo = "bar"
#  }
# }

variable "project_id" {
  type    = string
  default = "foo-bar"

}

resource "google_service_account_iam_member" "some-workloadIdentityUser" {
  service_account_id = google_service_account.some.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:foo.svc.id.goog[kube-system/bar]"
}

# ---------------------------------------------------- #
# ---- some-team google artifact registry resource --- #

resource "google_artifact_registry_repository" "some-image-registry" {
  project       = var.project_id
  location      = "us"
  repository_id = "some-images"
  description   = "some repository"
  format        = "DOCKER"
}

resource "google_service_account_iam_member" "some_service-account_impersonation" {
  service_account_id = "projects/my-project-id/serviceAccounts/some-service-account-name@my-project-id.iam.gserviceaccount.com"
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${module.my-cluster.iam-workload_identity-pool}/attribute.repository/my-org/my-repo"
}

resource "google_pubsub_topic_iam_binding" "some_team_pubsub-topic_publisher" {
  project = var.project_id
  topic   = google_pubsub_topic.some_team-pubsub.name
  role    = "roles/pubsub.publisher"
  members = [
    "serviceAccount:${google_service_account.some-team_service-account.email}",
    "serviceAccount:some-service-account@my-project-id.iam.gserviceaccount.com",
    "group:some_gcp_user-group@example.com",
  ]
}

resource "google_pubsub_subscription" "some_team-name_engineer_subscription" {
  name  = "some_team-name_engineer_subscription"
  topic = google_pubsub_topic.some_team-name_topic.name
  bigquery_config {
    table = "my-project-id.some.table-name"
  }
  labels = {
    team = "some-team-name"
  }
}
