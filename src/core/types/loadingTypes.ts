type LoadingContextType = {
  isLoading: boolean;
  setIsLoading:
    | ((isLoading: boolean) => void)
    | React.Dispatch<React.SetStateAction<boolean>>;
};

export type { LoadingContextType };
