moved {
  from = module.gke-cluster
  to   = module.gke_cluster
}

moved {
  from = google_service_account.some-account
  to   = google_service_account.some_account
}

moved {
  from = google_service_account_iam_member.sa-member
  to   = google_service_account_iam_member.sa_member
}

moved {
  from = google_service_account_iam_member.some-workloadIdentityUser
  to   = google_service_account_iam_member.some_workloadIdentityUser
}

moved {
  from = google_artifact_registry_repository.some-image-registry
  to   = google_artifact_registry_repository.some_image_registry
}

moved {
  from = google_service_account_iam_member.some_service-account_impersonation
  to   = google_service_account_iam_member.some_service_account_impersonation
}

moved {
  from = google_pubsub_topic_iam_binding.some_team_pubsub-topic_publisher
  to   = google_pubsub_topic_iam_binding.some_team_pubsub_topic_publisher
}

moved {
  from = google_pubsub_subscription.some_team-name_engineer_subscription
  to   = google_pubsub_subscription.some_team_name_engineer_subscription
}
