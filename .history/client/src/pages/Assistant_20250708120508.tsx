

const Assistant = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumb("To-do List"))
  }, [dispatch])
  return (
    <div>Assistant</div>
  )
}

export default Assistant