import styles from './loading.module.css'

export default function AdminDashboardLoading() {
  return (
    <div className={styles.stage} role="status" aria-live="polite" aria-label="Chargement de la page">
      <div className={styles.indicator}>
        <span className={styles.spinner} aria-hidden="true" />
        <span className={styles.label}>Chargement</span>
      </div>
    </div>
  )
}
